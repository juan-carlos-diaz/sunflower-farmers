import React, { useContext, useState } from "react";
import Modal from "react-bootstrap/Modal";
import basket from "assets/icons/basket.png";
import button from "assets/ui/button/round_button.png";

import { Label } from "components/ui/Label";
import { OuterPanel, Panel } from "components/ui/Panel";
import { Box } from "components/ui/Box";

import { InventoryItems } from "./InventoryItems";
import { Context } from "features/game/GameProvider";

import { getShortcuts } from "../lib/shortcuts";
import { ITEM_DETAILS } from "features/game/lib/items";

export const Inventory: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, shortcutItem } = useContext(Context);
  const inventory = state.inventory;

  const shortcuts = getShortcuts();

  return (
    <div className="fixed top-16 right-0 z-50">
      <div
        className="w-16 h-16 mx-8 mt-2 relative flex justify-center items-center shadow rounded-full cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={button}
          className="absolute w-full h-full -z-10"
          alt="inventoryButton"
        />
        <img src={basket} className="w-8 mb-1" alt="inventory" />
        <Label className="absolute -bottom-7">Inventory</Label>
      </div>

      <Modal centered show={isOpen} onHide={() => setIsOpen(false)}>
        <InventoryItems />
      </Modal>

      <div className="flex flex-col items-center mt-8">
        {shortcuts.map((item, index) => (
          <Box
            key={index}
            isSelected={index === 0}
            image={ITEM_DETAILS[item].image}
            count={inventory[item]}
            onClick={() => shortcutItem(item)}
          />
        ))}
      </div>
    </div>
  );
};