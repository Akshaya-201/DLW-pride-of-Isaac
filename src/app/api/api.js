// src/app/api/api.js

// Get Location
export function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                callback({ latitude, longitude });
            },
            (error) => {
                console.error("Error obtaining location:", error);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Send SMS to your API route
export async function sendSMS(to, body) {
    try {
        const response = await fetch('/api/sendSMS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, body }),
        });

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const errorMessage = isJson
                ? `${payload.error || 'Request failed'}${payload.details ? `: ${payload.details}` : ''}`
                : 'Request failed with non-JSON response';
            throw new Error(`Failed to send SMS: ${errorMessage}`);
        }

        const data = payload;
        console.log("Message sent:", data.sid); // Log the SID returned from the server
        return data.sid; // Return the message SID for further processing if needed
    } catch (error) {
        console.error("Error:", error);
        throw error; // Rethrow the error for handling in the calling function
    }
}
