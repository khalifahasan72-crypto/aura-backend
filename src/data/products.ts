export interface ProductOption {
    name: string;
    label: string;
    type: 'text' | 'select' | 'file';
    options?: string[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    image: string;
    optionsSchema: ProductOption[];
    glbPath?: string;
    weightInGrams?: number;
    filamentCostPerGramAED?: number;
    electricityCostAED?: number;
    laborCostAED?: number;
}

export const PRODUCTS: Product[] = [

    {
        id: 't13-figure',
        name: 'T13 Action Figure',
        description: 'Fully articulated 3D printed action figure. Includes movable joints.',
        basePrice: 15.00,
        image: 'https://placehold.co/400x300?text=T13+Figure',
        optionsSchema: [
            { name: 'armorColor', label: 'Armor Color', type: 'select', options: ['Black', 'Blue', 'White', 'Red', 'Neon Green'] },
            { name: 'jointColor', label: 'Joint Color', type: 'select', options: ['Black', 'White', 'Gold', 'Red', 'Blue', 'Neon Green'] },
            { name: 'accessories', label: 'Accessories', type: 'select', options: ['None', 'Weapons Kit & Ready Build (2 Hats, 2 Katanas, 1 Gun)'] }
        ],
        glbPath: '/models/t13.glb',
        weightInGrams: 85,
        filamentCostPerGramAED: 0.12,
        electricityCostAED: 1.20,
        laborCostAED: 2.00
    },
    {
        id: 'phone-stand',
        name: 'Phone Stand',
        description: 'The original sturdy mount. Select 100% for maximum durability.',
        basePrice: 9.99,
        image: 'https://placehold.co/400x300?text=Phone+Stand',
        optionsSchema: [
            { name: 'strength', label: 'Strength', type: 'select', options: ['50%', '100%'] }
        ],
        glbPath: '/models/phonestand-v1.glb'
    },
    {
        id: 'dragon-model',
        name: 'Dragon',
        description: 'Spectacular articulated dragon. It moves and it\'s like a fidget toy you can play with! Currently available only in White.',
        basePrice: 15.00,
        image: 'https://placehold.co/400x300?text=Dragon',
        optionsSchema: [
            { name: 'color', label: 'Color', type: 'select', options: ['White'] }
        ],
        glbPath: '/models/dragon.glb'
    }
];
