# Venice.ai API: Initial Research vs. Swagger Analysis

The analysis of the provided `VeniceAPIswagger.yaml` file has revealed several advanced features and endpoints that were not fully detailed in the initial documentation review.

## New & Expanded Endpoints

| Category | Initial Research | Swagger Discovery |
| :--- | :--- | :--- |
| **Video** | Mentioned generally | Full suite: `/video/complete`, `/video/queue`, `/video/quote`, `/video/retrieve` |
| **Audio** | ASR mentioned | Added Speech-to-Speech and Text-to-Speech: `/audio/speech`, `/audio/transcriptions` |
| **Model Metadata** | `/models` | Advanced metadata: `/models/traits`, `/models/compatibility_mapping` |
| **Characters** | Mentioned in params | Dedicated management: `/characters` (GET list, GET specific) |
| **Billing & Keys** | Not explored | Usage tracking: `/billing/usage`, plus full API Key management endpoints |

## Advanced Request Parameters (Chat)

The Swagger file reveals a much deeper set of parameters for the `ChatCompletionRequest` than standard OpenAI compatibility suggests:

- **Dynamic Temperature**: `min_temp` and `max_temp` for scaling.
- **Advanced Sampling**: `min_p`, `top_k`, and `repetition_penalty`.
- **Prompt Caching**: Detailed `prompt_cache_key` and `prompt_cache_retention` (OpenAI-compatible).
- **Multimodal Support**: Explicit support for `image_url`, `input_audio`, and `video_url` in message content arrays.

## Implications for the Demo
The demo script should be updated to include:
1.  **Model Traits/Compatibility**: Show how to discover model capabilities programmatically.
2.  **Multimodal Chat**: Example of sending an image/audio reference in a chat request.
3.  **Video Queue/Retrieve**: Briefly explain the asynchronous nature of video generation.
4.  **Billing Usage**: Show how to check remaining credits/usage programmatically.
