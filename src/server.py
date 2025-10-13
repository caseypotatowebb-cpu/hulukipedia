"""Hulukipedia API gateway powered by liteLLM."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from litellm import Router
except ImportError as exc:  # pragma: no cover - litellm is required at runtime
    raise RuntimeError("liteLLM must be installed to run the Hulukipedia gateway") from exc

try:
    import yaml
except ImportError as exc:  # pragma: no cover - yaml is required at runtime
    raise RuntimeError("PyYAML must be installed to run the Hulukipedia gateway") from exc

load_dotenv()

CONFIG_PATH = os.getenv("HULUKIPEDIA_LITELLM_CONFIG", "litellm_config.yaml")
if not os.path.exists(CONFIG_PATH):
    raise RuntimeError(
        "liteLLM configuration file not found. Set HULUKIPEDIA_LITELLM_CONFIG or create litellm_config.yaml"
    )


def _load_yaml(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as config_file:
        return yaml.safe_load(config_file) or {}


CONFIG_DATA = _load_yaml(CONFIG_PATH)


@lru_cache(maxsize=1)
def _build_router() -> Router:
    return Router(config_file=CONFIG_PATH)


ROUTER = _build_router()


class ProviderInfo(BaseModel):
    alias: str
    display_name: str
    provider: str
    model: Optional[str] = None
    description: Optional[str] = None
    capabilities: List[str] = Field(default_factory=list)


class GenerateRequest(BaseModel):
    agent: Optional[str] = Field(
        default=None,
        description="Optional Team Tomorrow agent label (Monday, Tuesday, etc.)",
    )
    prompt: str
    provider: Optional[str] = Field(
        default=None, description="Alias of the model to call (from /v1/providers)."
    )
    model: Optional[str] = Field(
        default=None,
        description="Explicit liteLLM model alias. Overrides provider and agent defaults.",
    )
    options: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional keyword arguments passed through to liteLLM.",
    )


class GenerateResponse(BaseModel):
    alias: str
    provider: Optional[str] = None
    model: Optional[str] = None
    content: str
    usage: Optional[Dict[str, Any]] = None


class ImageRequest(BaseModel):
    prompt: str
    agent: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    size: Optional[str] = Field(default="1024x1024")
    options: Dict[str, Any] = Field(default_factory=dict)


class ImageResponse(BaseModel):
    alias: str
    provider: Optional[str] = None
    model: Optional[str] = None
    image_b64: str
    usage: Optional[Dict[str, Any]] = None


DEFAULT_AGENT_MAP: Dict[str, str] = CONFIG_DATA.get("hulukipedia_defaults", {})
PROVIDER_LOOKUP: Dict[str, ProviderInfo] = {}


for entry in CONFIG_DATA.get("model_list", []):
    alias = entry.get("model_name")
    if not alias:
        continue
    metadata = entry.get("metadata", {})
    litellm_params = entry.get("litellm_params", {})
    PROVIDER_LOOKUP[alias] = ProviderInfo(
        alias=alias,
        display_name=metadata.get("display_name", alias),
        provider=metadata.get("provider") or litellm_params.get("provider", "unknown"),
        model=litellm_params.get("model"),
        description=metadata.get("description"),
        capabilities=metadata.get("capabilities", []),
    )


def _resolve_alias(agent: Optional[str], provider: Optional[str], model: Optional[str]) -> str:
    if model:
        return model
    if provider:
        return provider
    if agent:
        default_alias = DEFAULT_AGENT_MAP.get(agent.lower())
        if default_alias:
            return default_alias
    raise HTTPException(status_code=400, detail="No model alias was provided or configured for this agent.")


def _normalize_completion_payload(result: Any) -> Dict[str, Any]:
    if isinstance(result, dict):
        return result
    if hasattr(result, "model_dump"):
        return result.model_dump()
    if hasattr(result, "dict"):
        return result.dict()
    try:
        return json.loads(json.dumps(result, default=str))
    except Exception as exc:  # pragma: no cover - defensive branch
        raise HTTPException(status_code=500, detail=f"Unable to parse model response: {exc}") from exc


app = FastAPI(title="Hulukipedia Gateway", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/v1/providers", response_model=List[ProviderInfo])
async def list_providers() -> List[ProviderInfo]:
    return list(PROVIDER_LOOKUP.values())


@app.post("/v1/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest) -> GenerateResponse:
    alias = _resolve_alias(request.agent, request.provider, request.model)
    try:
        result = await ROUTER.acompletion(
            model=alias,
            messages=[{"role": "user", "content": request.prompt}],
            **request.options,
        )
    except Exception as exc:  # pragma: no cover - runtime error handling
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    payload = _normalize_completion_payload(result)
    choices = payload.get("choices", [])
    if not choices:
        raise HTTPException(status_code=502, detail="The model returned an empty response.")
    message = choices[0].get("message") or {}
    content = message.get("content")
    if content is None:
        raise HTTPException(status_code=502, detail="The model response did not include text content.")

    provider_info = PROVIDER_LOOKUP.get(alias)
    return GenerateResponse(
        alias=alias,
        provider=provider_info.provider if provider_info else None,
        model=provider_info.model if provider_info else None,
        content=content,
        usage=payload.get("usage"),
    )


@app.post("/v1/images", response_model=ImageResponse)
async def generate_image(request: ImageRequest) -> ImageResponse:
    alias = _resolve_alias(request.agent, request.provider, request.model or DEFAULT_AGENT_MAP.get("images"))
    try:
        result = await ROUTER.aimage_generation(
            prompt=request.prompt,
            model=alias,
            size=request.size,
            **request.options,
        )
    except AttributeError:
        raise HTTPException(
            status_code=400,
            detail="The configured liteLLM Router does not support image generation. Verify model capabilities.",
        )
    except Exception as exc:  # pragma: no cover - runtime error handling
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    payload = _normalize_completion_payload(result)
    images = payload.get("data") or payload.get("images") or []
    if not images:
        raise HTTPException(status_code=502, detail="Image generation returned no data.")

    first_image = images[0]
    image_b64 = first_image.get("b64_json") or first_image.get("image_base64")
    if not image_b64:
        raise HTTPException(status_code=502, detail="Image data missing from provider response.")

    provider_info = PROVIDER_LOOKUP.get(alias)
    return ImageResponse(
        alias=alias,
        provider=provider_info.provider if provider_info else None,
        model=provider_info.model if provider_info else None,
        image_b64=image_b64,
        usage=payload.get("usage"),
    )


@app.get("/v1/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":  # pragma: no cover - manual execution helper
    import uvicorn

    uvicorn.run("src.server:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
