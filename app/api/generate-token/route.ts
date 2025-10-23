import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * 生成JWT Token接口
 * 用于为客户端生成包含clientId的JWT token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clientId } = body;

        if (!clientId) {
            return NextResponse.json(
                { error: 'clientId is required' },
                { status: 400 }
            );
        }

        // 生成JWT token，使用clientId作为secret
        const token = jwt.sign(
            { 
                clientId,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
            },
            clientId, // 使用clientId作为签名密钥
            { algorithm: 'HS256' }
        );

        return NextResponse.json({
            success: true,
            token,
            expiresIn: '24h'
        });

    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
