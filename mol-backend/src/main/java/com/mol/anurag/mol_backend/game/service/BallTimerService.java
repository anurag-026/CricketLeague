package com.mol.anurag.mol_backend.game.service;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Component
public class BallTimerService {

    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "mol-ball-timer");
                t.setDaemon(true);
                return t;
            });

    private final Map<UUID, ScheduledFuture<?>> timers = new ConcurrentHashMap<>();

    public void schedule(UUID duelId, Runnable task, long delayMs) {
        cancel(duelId);
        ScheduledFuture<?> future =
                scheduler.schedule(task, delayMs, TimeUnit.MILLISECONDS);
        timers.put(duelId, future);
    }

    public void cancel(UUID duelId) {
        ScheduledFuture<?> future = timers.remove(duelId);
        if (future != null) {
            future.cancel(false);
        }
    }
}
