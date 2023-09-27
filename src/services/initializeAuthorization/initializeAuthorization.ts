import { AuthorizationData } from "../../datafeed/authorizationData";
import { authorize } from "../../utils/authorize";
import {
  TAuthorizationUser,
  TInitializeAutorizationArgs,
} from "./initializeAuthorization.types";

/**
 * Initializes authorization for a wallet address.
 * @param walletAddress - The wallet address to authorize.
 * @returns A promise that resolves to an instance of AuthorizationData.
 */
export const initializeAutorization = async ({
  wallet,
}: TInitializeAutorizationArgs): Promise<
  AuthorizationData<TAuthorizationUser>
> => {
  // Authorize the wallet address with a 24-hour expiration time.
  const initialData = await authorize(wallet, 86400);

  // Create an instance of AuthorizationData with the initial data and a createCallback function that authorizes the wallet address with a 24-hour expiration time.
  const authorizationDataInstance = new AuthorizationData<TAuthorizationUser>({
    initialData,
    createCallback: () => authorize(wallet, 86400)
  });
  return authorizationDataInstance;
};
