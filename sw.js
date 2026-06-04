// Avance - Service Worker
const CACHE = 'avance-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : {title:'Avance', body:'Lembrete'};
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100, 50, 100],
      tag: d.tag || 'avance',
      requireInteraction: false
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window'}).then(list => {
      if(list.length) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});

// recebe tarefas agendadas da página
let _scheduled = [];
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE'){
    _scheduled = e.data.tasks || [];
  }
});
