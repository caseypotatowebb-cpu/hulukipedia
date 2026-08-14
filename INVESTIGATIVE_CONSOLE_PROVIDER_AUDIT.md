# Investigative Console Provider and Virtual Try-On Audit

**Date:** August 13, 2026  
**Scope:** Eligible model additions, Google Virtual Try-On assessment, and requirements for a direct investigative console.

## Account-verified model findings

| Candidate | Account/catalog result | Invocation result | Product decision |
|---|---|---|---|
| Claude Opus 4.6 | Present in the authenticated Anthropic account catalog as `claude-opus-4-6`. | Direct `POST /v1/messages` smoke test returned `available`. | Add as a direct Anthropic option and approved Role-Play alternate. It complies with the user's “before 4.8” Claude policy. |
| Gemini 2.5 Pro | Listed by the Gemini account as `models/gemini-2.5-pro`, including `generateContent`. | Both `v1beta` and stable `v1` generation calls returned HTTP 404. The stable API explicitly says the model is no longer available to new users. | Do **not** expose a dead-end selector item for this Team Tomorrow credential. Keep the 3.1 Pro route, which was confirmed live in release 3.3.0. |
| Gemini 3.1 Pro | Present in the Gemini catalog as `gemini-3.1-pro-preview`. | Verified through the Hulukipedia production Worker in release 3.3.0. | Retain. |
| OpenAI eligible models | Current account inventory did not return an additional eligible GPT-5.1-or-earlier model during this audit. | No new usable direct route established. | Keep GPT-4o as the direct OpenAI option. |

## Google Virtual Try-On assessment

Google's GA `virtual-try-on-001` model produces images of a supplied person wearing a supplied clothing-product image. It accepts up to two input images, generates one to four output images, and preserves the input image aspect ratio/resolution. It is not a chat or text-generation model.[1]

The right Hulukipedia use case is a future **Wardrobe / Try-On** action inside the Visual Scene Studio: select or upload a base character/portrait image, provide a garment/product image, generate one to four wardrobe transformation candidates, and preserve the existing normal portrait/scene workflows.

This cannot be wired securely with the existing Gemini API key alone. Google requires a billing-enabled Google Cloud project, the Agent Platform API (`aiplatform.googleapis.com`), Google Cloud authentication, a supported region, and a Cloud Storage output path. REST requests use an OAuth Bearer token against the regional Vertex/Gemini Enterprise `publishers/google/models/virtual-try-on-001:predict` endpoint.[2]

**Do not integrate yet.** The user has asked for an assessment, and no Google Cloud project ID, region, service-account credential/workload identity, or Cloud Storage destination has been provided. Once those are available, this is a strong, bounded Visual Scene Studio extension—not a replacement for general image generation.

## Sources

[1]: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/vto/virtual-try-on-001
[2]: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/generate-virtual-try-on-images
