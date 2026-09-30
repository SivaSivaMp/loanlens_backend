import { IHashService } from "@/application/interfaces/IHashService";
import bcrypt from "bcryptjs";
import { injectable } from "tsyringe";

@injectable()
export class BcryptHashService implements IHashService {
  private readonly saltRounds = 12;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
