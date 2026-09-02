import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuditActor } from './audit-actor';

type AuditContextStore = {
	actor?: AuditActor;
};

@Injectable()
export class AuditContextService {
	private readonly storage = new AsyncLocalStorage<AuditContextStore>();

	run<T>(callback: () => T): T {
		return this.storage.run({}, callback);
	}

	setActor(actor: AuditActor): void {
		const store = this.storage.getStore();
		if (!store) throw new Error('Audit context is not initialized');
		store.actor = actor;
	}

	getActor(): AuditActor {
		const actor = this.storage.getStore()?.actor;
		if (!actor) throw new Error('Audit actor is not available');
		return actor;
	}
}
