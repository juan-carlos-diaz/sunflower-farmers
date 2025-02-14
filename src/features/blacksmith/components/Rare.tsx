import React, { useContext, useEffect, useState } from "react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import Decimal from "decimal.js-light";

import token from "assets/icons/token.gif";

import { Box } from "components/ui/Box";
import { OuterPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { Context } from "features/game/GameProvider";
import { ITEM_DETAILS } from "features/game/types/images";
import { Craftable } from "features/game/types/craftables";
import { GameState, InventoryItemName } from "features/game/types/game";
import { metamask } from "lib/blockchain/metamask";
import { ItemSupply } from "lib/blockchain/Inventory";
import { useShowScrollbar } from "lib/utils/hooks/useShowScrollbar";

const TAB_CONTENT_HEIGHT = 360;

interface Props {
  onClose: () => void;
  items: Partial<Record<InventoryItemName, Craftable>>;
  hasAccess: boolean;
}

const Items: React.FC<{
  items: Props["items"];
  selected: InventoryItemName;
  inventory: GameState["inventory"];
  onClick: (item: Craftable) => void;
}> = ({ items, selected, inventory, onClick }) => {
  const { ref: itemContainerRef, showScrollbar } =
    useShowScrollbar(TAB_CONTENT_HEIGHT);

  const ordered = Object.values(items).sort((a, b) =>
    a.name > b.name ? 1 : -1
  );

  return (
    <div
      ref={itemContainerRef}
      style={{ maxHeight: TAB_CONTENT_HEIGHT }}
      className={classNames("overflow-y-auto w-3/5 pt-1 mr-2", {
        scrollable: showScrollbar,
      })}
    >
      <div className="flex flex-wrap h-fit">
        {ordered.map((item) => (
          <Box
            isSelected={selected === item.name}
            key={item.name}
            onClick={() => onClick(item)}
            image={ITEM_DETAILS[item.name].image}
            count={inventory[item.name]}
          />
        ))}
      </div>
    </div>
  );
};
export const Rare: React.FC<Props> = ({ onClose, items, hasAccess }) => {
  const [selected, setSelected] = useState<Craftable>(Object.values(items)[0]);
  const { gameService } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);
  const [isLoading, setIsLoading] = useState(true);
  const [supply, setSupply] = useState<ItemSupply>();

  useEffect(() => {
    const load = async () => {
      const supply = await metamask.getInventory().totalSupply();
      setSupply(supply);
      setIsLoading(false);
    };

    load();
  }, []);
  const inventory = state.inventory;

  const lessIngredients = (amount = 1) =>
    selected.ingredients.some((ingredient) =>
      ingredient.amount.mul(amount).greaterThan(inventory[ingredient.item] || 0)
    );
  const lessFunds = (amount = 1) =>
    state.balance.lessThan(selected.price.mul(amount));

  const craft = () => {
    gameService.send("MINT", { item: selected.name });
    onClose();
  };

  if (isLoading) {
    return <span>Loading...</span>;
  }

  let amountLeft = 0;
  if (supply && selected.supply) {
    amountLeft = selected.supply - supply[selected.name]?.toNumber();
  }

  const soldOut = amountLeft <= 0;

  const Action = () => {
    if (soldOut) {
      return null;
    }

    if (!hasAccess) {
      return <span className="text-sm text-center">Locked</span>;
    }

    if (state.inventory[selected.name]) {
      return <span className="text-xs mt-1 text-center">Already minted</span>;
    }

    if (selected.requires && !state.inventory[selected.requires]) {
      return (
        <div className="flex items-center">
          <img
            src={ITEM_DETAILS[selected.requires].image}
            className="w-6 h-6 mr-1"
          />
          <span className="text-xs text-shadow text-center mt-2">
            {`${selected.requires}s only`}
          </span>
        </div>
      );
    }

    return (
      <>
        <Button
          disabled={lessFunds() || lessIngredients()}
          className="text-xs mt-1"
          onClick={() => craft()}
        >
          Craft
        </Button>
      </>
    );
  };

  return (
    <div className="flex">
      <Items
        items={items}
        selected={selected.name}
        inventory={inventory}
        onClick={setSelected}
      />
      <OuterPanel className="flex-1 w-1/3">
        <div className="flex flex-col justify-center items-center p-2 relative">
          {soldOut && (
            <span className="bg-blue-600 text-shadow border text-xxs absolute left-0 -top-4 p-1 rounded-md">
              Sold out
            </span>
          )}
          {!!selected.supply && amountLeft > 0 && (
            <span className="bg-blue-600 text-shadow border  text-xxs absolute left-0 -top-4 p-1 rounded-md">
              {`${amountLeft} left`}
            </span>
          )}

          <span className="text-shadow text-center">{selected.name}</span>
          <img
            src={ITEM_DETAILS[selected.name].image}
            className="h-16 img-highlight mt-1"
            alt={selected.name}
          />
          <span className="text-shadow text-center mt-2 sm:text-sm">
            {selected.description}
          </span>
          {hasAccess ? (
            <div className="border-t border-white w-full mt-2 pt-1">
              {selected.ingredients.map((ingredient, index) => {
                const item = ITEM_DETAILS[ingredient.item];
                const lessIngredient = new Decimal(
                  inventory[ingredient.item] || 0
                ).lessThan(ingredient.amount);

                return (
                  <div className="flex justify-center items-end" key={index}>
                    <img src={item.image} className="h-5 me-2" />
                    <span
                      className={classNames(
                        "text-xs text-shadow text-center mt-2 ",
                        {
                          "text-red-500": lessIngredient,
                        }
                      )}
                    >
                      {ingredient.amount.toNumber()}
                    </span>
                  </div>
                );
              })}

              <div className="flex justify-center items-end">
                <img src={token} className="h-5 mr-1" />
                <span
                  className={classNames(
                    "text-xs text-shadow text-center mt-2 ",
                    {
                      "text-red-500": lessFunds(),
                    }
                  )}
                >
                  {`$${selected.price.toNumber()}`}
                </span>
              </div>
            </div>
          ) : (
            <span>?</span>
          )}

          {Action()}
        </div>
      </OuterPanel>
    </div>
  );
};
