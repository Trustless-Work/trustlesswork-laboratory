export function getAddressOccurrenceCounts(
  roles: readonly { addresses: readonly string[] }[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const role of roles) {
    for (const address of role.addresses) {
      counts.set(address, (counts.get(address) ?? 0) + 1);
    }
  }

  return counts;
}

export function isSharedEscrowAddress(
  counts: ReadonlyMap<string, number>,
  address: string,
): boolean {
  return (counts.get(address) ?? 0) > 1;
}
