import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";

type Request = {
  sessionId: string;
  farmId: number;
  token: string;
};

const API_URL = CONFIG.API_URL;

async function signTransaction(request: Request) {
  const response = await window.fetch(`${API_URL}/sync`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${request.token}`,
    },
    body: JSON.stringify({
      sessionId: request.sessionId,
      farmId: request.farmId,
    }),
  });

  const data = await response.json();

  return data;
}

type Options = {
  farmId: number;
  sessionId: string;
  token: string;
};
export async function sync({ farmId, sessionId, token }: Options) {
  if (!API_URL) return;

  const transaction = await signTransaction({
    farmId,
    sessionId,
    token,
  });

  const newSessionId = await metamask.getSessionManager().sync(transaction);

  return newSessionId;
}
