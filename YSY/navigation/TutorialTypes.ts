import { LoginOptions } from '../util/login';

export type TutorialTypes = {
  Tutorial: undefined;
  ConnectCouple: {
    myCode: string;
    otherCode?: string;
  };
  AdditionalInformation: {
    info: LoginOptions;
  };
};
