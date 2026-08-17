import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Manager API',
            version: '1.0.0',
            description: 'API documentation for our event manager backend'
        },
        servers: [
            {
                url: process.env.NODE_ENV == "development" ? 'http://localhost:5000' : "https://mentorship-api-jys6.onrender.com"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')]
};

export const swaggerSpec = swaggerJSDoc(options);
