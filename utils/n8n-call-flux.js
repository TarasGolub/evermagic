// n8n Code node — "Call Flux (Replicate)"
// Place AFTER "Build Image Prompts" in a Loop/SplitInBatches
// Each input item has: { order_id, image_type, prompt }
//
// This node makes the Replicate API call to generate one image.
// You need a Replicate API token stored in n8n credentials (Header Auth).
//
// WORKFLOW WIRING:
//   Build Image Prompts → SplitInBatches → Call Flux (HTTP Request) → Wait → Check Status (HTTP) → Save Image
//
// OPTION A: Use this Code node to build the HTTP request body
// OPTION B: Use an HTTP Request node directly (config below)

// ─────────────────────────────────────────────────────────────
// OPTION A: Code node that prepares the Replicate API call
// ─────────────────────────────────────────────────────────────

const item = $input.first().json;

// Flux 1.1 Pro on Replicate
// Docs: https://replicate.com/black-forest-labs/flux-1.1-pro
const replicatePayload = {
    // Using Flux 1.1 Pro
    version: 'black-forest-labs/flux-1.1-pro',
    input: {
        prompt: item.prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        output_format: 'png',
    }
};

return [{
    json: {
        ...item,
        replicate_url: 'https://api.replicate.com/v1/predictions',
        replicate_body: replicatePayload,
    }
}];

// ─────────────────────────────────────────────────────────────
// OPTION B: HTTP Request node settings (alternative to Code)
// ─────────────────────────────────────────────────────────────
//
// Method: POST
// URL: https://api.replicate.com/v1/predictions
// Authentication: Header Auth
//   - Name: Authorization
//   - Value: Bearer YOUR_REPLICATE_TOKEN
//
// Body (JSON):
// {
//   "version": "black-forest-labs/flux-1.1-pro",
//   "input": {
//     "prompt": "{{ $json.prompt }}",
//     "width": 1024,
//     "height": 1024,
//     "num_outputs": 1,
//     "guidance_scale": 3.5,
//     "num_inference_steps": 28,
//     "output_format": "png"
//   }
// }
//
// IMPORTANT: Replicate is async. The response gives you a prediction ID.
// You need to poll GET https://api.replicate.com/v1/predictions/{id}
// until status === "succeeded", then grab output[0] for the image URL.
//
// In n8n, use a Wait node (30 seconds) + HTTP Request to check status.
// Or use the webhook callback approach:
//   Add "webhook": "https://evermagic.app.n8n.cloud/webhook/replicate-callback"
//   to the prediction body, and Replicate will POST back when done.
