export enum Fruit {
    None = '0',
    Sunflower = '1',
    Potato = '2',
    Pumpkin = '3',
    Beetroot = '4',
    Cauliflower = '5',
    Parsnip = '6',
    Radish = '7',
}

export enum Charity {
    TheWaterProject = '0x060697E9d4EEa886EbeCe57A974Facd53A40865B',
    Heifer = '0xD3F81260a44A1df7A7269CF66Abd9c7e4f8CdcD1',
    CoolEarth = '0x3c8cB169281196737c493AfFA8F49a9d823bB9c5'
}

export interface Square {
    fruit: Fruit
    createdAt: number
}


export interface Transaction {
    fruit: Fruit
    createdAt: number
    action: Action
    landIndex: number
}

export enum Action {
    Plant = 0,
    Harvest = 1
}