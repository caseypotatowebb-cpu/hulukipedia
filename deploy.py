#!/usr/bin/env python3
"""
Deploy Hulukipedia to Cloudflare Workers using the REST API.
Uses X-Auth-Email + X-Auth-Key (Global API Key) authentication.

Based on: https://developers.cloudflare.com/workers/static-assets/direct-upload/

Workers with Assets deployment flow:
1. Create an assets upload session with file manifest (hashes + sizes)
2. Upload any new/changed asset files (base64 encoded, multipart)
3. Deploy the worker script with the completion JWT in metadata
"""

import os
import sys
import json
import hashlib
import base64
import requests
from pathlib import Path

# Configuration
ACCOUNT_ID = "968f6ba56b79ff3abf8a2cf0aac0aba1"
SCRIPT_NAME = "hulukipedia"
AUTH_EMAIL = "Teamtomorrowlabs@gmail.com"
AUTH_KEY = os.environ["CLOUDFLARE_API_TOKEN"]

# Paths
WORKER_DIR = Path("/home/ubuntu/hulukipedia")
WORKER_SCRIPT = WORKER_DIR / "worker" / "index.js"
DIST_DIR = WORKER_DIR / "dist"

BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}"

HEADERS = {
    "X-Auth-Email": AUTH_EMAIL,
    "X-Auth-Key": AUTH_KEY,
}


def compute_asset_hash(filepath):
    """
    Compute the hash Cloudflare expects for assets:
    SHA-256 of (base64(file_content) + file_extension), truncated to 32 hex chars.
    
    From the docs example:
    const hash = crypto.createHash("sha256")
        .update(fileContent.toString("base64") + extension)
        .digest("hex")
        .slice(0, 32);
    """
    with open(filepath, "rb") as f:
        content = f.read()
    
    # Get file extension without the dot
    extension = filepath.suffix[1:] if filepath.suffix else ""
    
    # Hash = SHA-256(base64(content) + extension), first 32 hex chars
    b64_content = base64.b64encode(content).decode("ascii")
    hash_input = b64_content + extension
    full_hash = hashlib.sha256(hash_input.encode("ascii")).hexdigest()
    
    return full_hash[:32]


def collect_assets(dist_dir):
    """Collect all static asset files from the dist directory."""
    assets = []
    for filepath in sorted(Path(dist_dir).rglob("*")):
        if filepath.is_file():
            rel_path = "/" + str(filepath.relative_to(dist_dir))
            file_size = filepath.stat().st_size
            assets.append({
                "path": rel_path,
                "filepath": filepath,
                "hash": compute_asset_hash(filepath),
                "size": file_size,
            })
    return assets


def step1_create_upload_session(assets):
    """Step 1: Create an assets upload session with the manifest."""
    print("📋 Step 1: Creating assets upload session...")
    
    # Build manifest: path -> {hash, size}
    manifest = {}
    for asset in assets:
        manifest[asset["path"]] = {
            "hash": asset["hash"],
            "size": asset["size"],
        }
    
    url = f"{BASE_URL}/workers/scripts/{SCRIPT_NAME}/assets-upload-session"
    
    response = requests.post(
        url,
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"manifest": manifest},
    )
    
    print(f"   Response: {response.status_code}")
    result = response.json()
    
    if not result.get("success"):
        print(f"   ❌ Error: {json.dumps(result.get('errors', []), indent=2)}")
        return None
    
    session = result["result"]
    jwt = session.get("jwt", "")
    buckets = session.get("buckets", [])
    
    print(f"   ✅ Session created!")
    print(f"   JWT: {jwt[:50]}...")
    print(f"   Buckets to upload: {len(buckets)}")
    
    if buckets:
        total_files = sum(len(b) for b in buckets)
        print(f"   Total files to upload: {total_files}")
    else:
        print(f"   All assets already cached - no uploads needed!")
    
    return session


def step2_upload_assets(session, assets):
    """Step 2: Upload asset files that Cloudflare doesn't already have."""
    buckets = session.get("buckets", [])
    upload_jwt = session.get("jwt", "")
    
    if not buckets:
        print("📦 Step 2: All assets already cached - skipping upload!")
        return upload_jwt  # This JWT is already the completion token
    
    print(f"📦 Step 2: Uploading {len(buckets)} bucket(s)...")
    
    # Build hash -> asset lookup
    hash_to_asset = {a["hash"]: a for a in assets}
    
    completion_jwt = None
    
    for i, bucket in enumerate(buckets):
        print(f"   Bucket {i+1}/{len(buckets)}: {len(bucket)} file(s)")
        
        # Build the payload: {hash: base64_content, ...}
        payload = {}
        for file_hash in bucket:
            if file_hash in hash_to_asset:
                asset = hash_to_asset[file_hash]
                with open(asset["filepath"], "rb") as f:
                    content = f.read()
                payload[file_hash] = base64.b64encode(content).decode("ascii")
                print(f"     - {asset['path']} ({asset['size']:,} bytes)")
            else:
                print(f"     ⚠️  Unknown hash: {file_hash}")
        
        # Upload using the Workers assets upload endpoint
        # POST /accounts/{account_id}/workers/assets/upload?base64=true
        upload_url = f"{BASE_URL}/workers/assets/upload"
        
        response = requests.post(
            upload_url,
            params={"base64": "true"},
            headers={
                "Authorization": f"Bearer {upload_jwt}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data=payload,
        )
        
        print(f"     Upload response: {response.status_code}")
        
        if response.status_code in (200, 201):
            result = response.json()
            if result.get("jwt"):
                completion_jwt = result["jwt"]
                print(f"     ✅ Got completion JWT!")
        else:
            print(f"     Response: {response.text[:300]}")
            
            # Try multipart form data approach
            print(f"     Trying multipart approach...")
            files = []
            for file_hash, b64_content in payload.items():
                # Determine content type from the asset
                asset = hash_to_asset.get(file_hash)
                ct = "application/octet-stream"
                if asset:
                    path_str = asset["path"]
                    if path_str.endswith(".js"):
                        ct = "application/javascript"
                    elif path_str.endswith(".css"):
                        ct = "text/css"
                    elif path_str.endswith(".html"):
                        ct = "text/html"
                
                files.append(
                    (file_hash, (file_hash, b64_content.encode(), ct))
                )
            
            response2 = requests.post(
                upload_url,
                params={"base64": "true"},
                headers={
                    "Authorization": f"Bearer {upload_jwt}",
                },
                files=files,
            )
            
            print(f"     Multipart response: {response2.status_code}")
            if response2.status_code in (200, 201, 202):
                result2 = response2.json()
                if result2.get("result", {}).get("jwt"):
                    completion_jwt = result2["result"]["jwt"]
                    print(f"     ✅ Got completion JWT!")
                elif result2.get("jwt"):
                    completion_jwt = result2["jwt"]
                    print(f"     ✅ Got completion JWT (top-level)!")
                else:
                    print(f"     Result: {json.dumps(result2, indent=2)[:300]}")
            else:
                print(f"     Response: {response2.text[:300]}")
    
    if not completion_jwt:
        print("   ⚠️  No completion JWT received - using upload JWT")
        return upload_jwt
    
    return completion_jwt


def step3_deploy_worker(completion_jwt):
    """Step 3: Deploy the worker script with the completion JWT."""
    print("🚀 Step 3: Deploying worker script...")
    
    with open(WORKER_SCRIPT, "r") as f:
        worker_code = f.read()
    
    print(f"   Script size: {len(worker_code):,} bytes")
    
    url = f"{BASE_URL}/workers/scripts/{SCRIPT_NAME}"
    
    # Build metadata
    metadata = {
        "main_module": "index.js",
        "compatibility_date": "2024-12-01",
        "bindings": [
            {
                "type": "assets",
                "name": "ASSETS",
            }
        ],
        "assets": {
            "jwt": completion_jwt,
            "config": {
                "not_found_handling": "single-page-application"
            }
        }
    }
    
    # Multipart upload with metadata and worker script
    files = [
        ("metadata", (None, json.dumps(metadata), "application/json")),
        ("index.js", ("index.js", worker_code, "application/javascript+module")),
    ]
    
    response = requests.put(url, headers=HEADERS, files=files)
    
    print(f"   Response: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        if result.get("success"):
            print(f"   ✅ Worker deployed successfully!")
            print(f"   Modified: {result['result'].get('modified_on', 'unknown')}")
            return True
        else:
            print(f"   ❌ Errors: {json.dumps(result.get('errors', []), indent=2)}")
            return False
    else:
        print(f"   ❌ HTTP {response.status_code}")
        print(f"   Response: {response.text[:500]}")
        return False


def verify_deployment():
    """Verify the deployment is live."""
    print("\n🔍 Verifying deployment...")
    
    import time
    time.sleep(3)  # Give Cloudflare a moment to propagate
    
    try:
        response = requests.get(
            "https://hulukipedia.teamtomorrowlabs.workers.dev/api/health",
            timeout=15,
        )
        print(f"   Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.text[:200]}")
            print(f"\n✅ Deployment verified! App is live at:")
            print(f"   https://hulukipedia.teamtomorrowlabs.workers.dev")
            return True
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Try the main page
    try:
        response = requests.get(
            "https://hulukipedia.teamtomorrowlabs.workers.dev/",
            timeout=15,
        )
        print(f"   Main page: {response.status_code} ({len(response.text):,} bytes)")
        if response.status_code == 200 and "Hulukipedia" in response.text:
            print(f"   ✅ Main page loads correctly!")
            return True
    except Exception as e:
        print(f"   Error: {e}")
    
    return False


def main():
    print("🦅 Hulukipedia Deployment - Pearl Knight Edition")
    print("=" * 50)
    print(f"   Account: {ACCOUNT_ID}")
    print(f"   Worker: {SCRIPT_NAME}")
    print()
    
    # Collect assets
    assets = collect_assets(DIST_DIR)
    print(f"📁 Found {len(assets)} static assets:")
    for asset in assets:
        print(f"   {asset['path']} ({asset['size']:,} bytes, hash: {asset['hash']})")
    print()
    
    # Step 1: Create upload session
    session = step1_create_upload_session(assets)
    if not session:
        print("\n❌ Failed to create upload session")
        sys.exit(1)
    
    # Step 2: Upload any needed assets
    completion_jwt = step2_upload_assets(session, assets)
    if not completion_jwt:
        print("\n❌ No completion JWT available")
        sys.exit(1)
    
    print(f"\n   Completion JWT: {completion_jwt[:50]}...")
    
    # Step 3: Deploy worker with completion JWT
    success = step3_deploy_worker(completion_jwt)
    
    if success:
        verify_deployment()
    else:
        print("\n❌ Deployment failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
