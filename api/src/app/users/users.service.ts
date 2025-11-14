import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) { }

    findAll() {
        return this.usersRepo.find();
    }

    findOne(id: string) {
        return this.usersRepo.findOne({ where: { id } });
    }

    findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email } });
    }

    async create(data: Partial<User>) {
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }
}
