/** Minimal async mutex — avoids a dependency just for refresh-token serialisation. */
export class Mutex {
  private locked = false;
  private waiters: Array<() => void> = [];

  isLocked(): boolean {
    return this.locked;
  }

  async acquire(): Promise<() => void> {
    while (this.locked) await this.waitForUnlock();
    this.locked = true;
    return () => this.release();
  }

  waitForUnlock(): Promise<void> {
    if (!this.locked) return Promise.resolve();
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  private release(): void {
    this.locked = false;
    const waiters = this.waiters;
    this.waiters = [];
    waiters.forEach((resolve) => resolve());
  }
}
