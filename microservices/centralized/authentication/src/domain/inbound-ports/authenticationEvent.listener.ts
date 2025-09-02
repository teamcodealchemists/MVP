import { CidDTO } from 'src/interfaces/dto/cid.dto';
import { SubDTO } from './../../interfaces/dto/sub.dto';
import { UserIdDTO } from 'src/interfaces/dto/userId.dto';
import { AuthenticationDTO } from 'src/interfaces/dto/authentication.dto';

export interface AuthenticationEventListener {
    login(authenticationDTO: AuthenticationDTO): Promise<string>;
    logout(subDTO: SubDTO): Promise<string>;
}
