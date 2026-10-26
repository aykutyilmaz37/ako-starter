import { buildRobots } from '@ako/web-core';

export function loader() {
  return new Response(buildRobots({ disallowAll: true }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
