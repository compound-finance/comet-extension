import { InMessage } from './MessageTypes';

/**
 * Extensions - Permissions
 *
 * Permissions define what an extension is allowed to do
 * via message passing to the app. For instance, if it
 * is allowed to send transactions to the provider (e.g.
 * MetaMask) on behalf of the user. We can allow more complex
 * permissions, such as push notifications or access tokens,
 * and permission can be fine-grained, such as restricting
 * reads or writes to only certain contracts addresses, or
 * on certain networks or deployments.
 */

export type Permissions = {
  read?: '*' | string | string[]; // Addresses contract is allowed to read from, "*" for any
  write?: '*' | string | string[]; // Addresses contract is allowed to write to, "*" for any
};

export function checkPermission(message: InMessage, permissions: Permissions): null | string {
  switch (message.type) {
    case 'read':
      if (permissions.read && (permissions.read === '*' || permissions.read.includes(message.to.toLowerCase()))) {
        return null;
      } else {
        return 'Read access denied';
      }
    case 'write':
      if (permissions.write && (permissions.write === '*' || permissions.write.includes(message.to.toLowerCase()))) {
        return null;
      } else {
        return 'Write access denied';
      }
    case 'sendWeb3':
      // TODO
      return null;
    default:
      throw new Error(`Unknown message: ${JSON.stringify(message)}`);
  }
}
