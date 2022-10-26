import { Permissions } from './Permissions.js';

/**
 * Extensions
 *
 * Here we manage the configuration for extensions. The configuration is
 * listed in `extensions/config.json` and must conform to the interface
 * below. New extensions are added or adjusted by changing the config
 * file. The file is currently a list (as opposed to a map) to enforce
 * ordering for enumeration.
 */

export type ExtensionSource = { url: string } | { ipfs: string; domain?: string; path?: string };

export type Links = {
  github: string;
  website: string;
};

export type SupportedMarkets = Record<string, string>;

export interface Extension {
  id: string;
  name: string;
  description: string;
  developer: string;
  links: Links;
  permissions: Permissions;
  source: ExtensionSource;
  supportedMarkets: SupportedMarkets;
}
