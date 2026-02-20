// Named exports
export * from "./analytics";
export * from "./supply";
export * from "./inflation";
export * from "./staking";
export * from "./factory"; // ContractFactoryModule

export * from "./shared";
export { PlaceholderModule } from "./shared/index";

// Default exports re-exported as named or default
export { AdvancedEconomyModule } from "./economy";
export { default as SecurityModule } from "./security";
export { default as LiquidityAdvancedModule } from "./liquidity";
export { default as HardwareModule } from "./hardware";
export { SwapModule } from "./swap";
export { FleetTransferModule } from "./fleet";
export { default as GovernanceModule } from "./governance";
export { default as EcosystemModule } from "./ecosystem";
