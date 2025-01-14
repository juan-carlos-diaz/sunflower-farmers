import Decimal from "decimal.js-light";
import { removeSession } from "features/auth/actions/login";
import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { makeGame } from "../lib/transforms";
import { GameState, InventoryItemName, Rock, Tree } from "../types/game";

type Request = {
  sessionId: string;
  farmId: number;
  token: string;
};

type Response = {
  game: GameState;
  offset: number;
  isBlacklisted?: boolean;
};

const API_URL = CONFIG.API_URL;

export async function loadSession(
  request: Request
): Promise<Response | undefined> {
  if (!API_URL) return;

  const response = await window.fetch(`${API_URL}/session`, {
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

  if (response.status === 401) {
    removeSession(metamask.myAccount as string);
  }

  const { farm, startedAt, isBlacklisted } = await response.json();

  const startedTime = new Date(startedAt);

  let offset = 0;
  // Clock is not in sync with actual UTC time
  if (Math.abs(startedTime.getTime() - Date.now()) > 1000 * 30) {
    console.log("Not in sync!", startedTime.getTime() - Date.now());
    offset = startedTime.getTime() - Date.now();
  }

  return {
    offset,
    game: makeGame(farm),
    isBlacklisted,
  };
}
