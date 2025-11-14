import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        console.log('✅ POST /api/auth/login - Login attempt for:', body.email);
        const user = await this.auth.validateUser(body.email, body.password);
        const result = await this.auth.login(user);
        console.log('✅ Login successful for user:', user?.email);
        return result;
    }
}
