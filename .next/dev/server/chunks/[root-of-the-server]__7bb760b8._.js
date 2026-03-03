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
"[project]/src/app/api/violence-detect/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
const DEFAULT_RESPONSE = {
    violenceDetected: false,
    confidence: 0,
    provider: "mock"
};
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
    const frameDataUrl = payload?.frameDataUrl;
    if (!frameDataUrl || typeof frameDataUrl !== "string") {
        return Response.json({
            error: "Missing frameDataUrl."
        }, {
            status: 400
        });
    }
    const detectorUrl = process.env.VIOLENCE_DETECTOR_URL;
    if (!detectorUrl) {
        return Response.json(DEFAULT_RESPONSE, {
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
                frameDataUrl
            })
        });
        if (!response.ok) {
            const text = await response.text();
            return Response.json({
                error: "Detector service returned an error.",
                details: text
            }, {
                status: 502
            });
        }
        const result = await response.json();
        return Response.json({
            violenceDetected: Boolean(result.violenceDetected),
            confidence: Number(result.confidence || 0),
            provider: result.provider || "external"
        }, {
            status: 200
        });
    } catch (error) {
        return Response.json({
            error: "Failed to call detector service.",
            details: error.message
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7bb760b8._.js.map