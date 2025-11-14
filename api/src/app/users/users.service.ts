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

    async findOneWithMembership(id: string) {
        const user = await this.usersRepo.findOne({
            where: { id },
            relations: ['memberships', 'memberships.organization'],
        });
        return user;
    }

    findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email } });
    }

    async findByEmailWithMembership(email: string) {
        const user = await this.usersRepo.findOne({
            where: { email },
            relations: ['memberships', 'memberships.organization'],
        });
        return user;
    }

    async create(data: Partial<User>) {
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }
}
