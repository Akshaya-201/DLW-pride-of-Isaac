module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/audio-violence-detect/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
function clamp01(value) {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value));
}
function heuristicFromRms(rms) {
    // RMS for normal speech/noise is typically low; map louder/intense audio upward.
    // This is a fallback only if no external detector service is configured.
    return clamp01((rms - 0.03) / 0.22);
}
async function POST(request) {
    let payload;
    try {
        payload = await request.json();
    } catch  {
        return Response.json({
            error: "Invalid JSON payload."
        }, {
            status: 400
        });
    }
    const rms = Number(payload?.rms || 0);
    const detectorUrl = process.env.AUDIO_VIOLENCE_DETECTOR_URL;
    if (!detectorUrl) {
        const confidence = heuristicFromRms(rms);
        return Response.json({
            violenceDetected: confidence >= 0.7,
            confidence,
            provider: "heuristic-rms"
        }, {
            status: 200
        });
    }
    try {
        const response = await fetch(detectorUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rms,
                source: payload?.source || "unknown"
            })
        });
        if (!response.ok) {
            const text = await response.text();
            return Response.json({
                error: "Audio detector service returned an error.",
                details: text
            }, {
                status: 502
            });
        }
        const result = await response.json();
        return Response.json({
            violenceDetected: Boolean(result.violenceDetected),
            confidence: clamp01(Number(result.confidence || 0)),
            provider: result.provider || "external-audio"
        }, {
            status: 200
        });
    } catch (error) {
        return Response.json({
            error: "Failed to call audio detector service.",
            details: error.message
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__88f4844d._.js.map