# AI models shipped with Joji (all free for commercial use)

| File | Model | License |
|---|---|---|
| lama-512b.onnx.* | LaMa big-lama (Samsung AI), exported to ONNX with the FFT as fixed DFT matrices, int8 weights except the first and last layers (keeps colour exact) | Apache-2.0 |
| depth-v2s.onnx.* | Depth Anything V2 **Small** (Base/Large are non-commercial, not used), int8 weights | Apache-2.0 |
| esrgan-x4.onnx.0 | Real-ESRGAN realesr-general-x4v3, blended 50/50 with the wdn (denoise) weights | BSD-3-Clause |
| cutout-mod.onnx.0 | MODNet photographic portrait matting (ZHKKKe), int8 weights | Apache-2.0 |
| magic-touch.tflite | MediaPipe Interactive Segmenter (Magic Touch) | Apache-2.0 |
| face-detect.tflite | MediaPipe BlazeFace short range | Apache-2.0 |
| ort-jsep.* | ONNX Runtime Web 1.23.2 (ort-jsep-m.js: memory limit read from `__joMemPages`) | MIT |
| migan-512.onnx.0 | MI-GAN 512 Places2 (Picsart AI Research), fp16 weights, float32 in/out. Fast eraser for the live result and weak phones | MIT |
| face-detect-far.tflite | MediaPipe BlazeFace full range (small, far faces) | Apache-2.0 |
| gfpgan-14.onnx.* | GFPGAN v1.4 (TencentARC, GFPGANv1Clean), fp16 weights, float32 in/out. **Not part of the app download**: the «HD الوجه» pack is fetched on request and each part is checked by SHA-256 before use. Trained on FFHQ (non-commercial image licence; the weights themselves are Apache-2.0: legal grey area, see the AI report) | Apache-2.0 |
| sam-ti-enc.onnx.* / sam-ti-dec.onnx.* | EfficientSAM-Ti (Meta / yformer) encoder + decoder, tap to select | Apache-2.0 |
| text-det.onnx.0 | PP-OCRv4 text detector (PaddleOCR, ONNX from RapidOCR), for "erase text" | Apache-2.0 |
