export default defineEventHandler((event) => {
  const url = event.node.req.url || '';
  
  // Handle any /robots*.txt request by serving the standard robots.txt
  if (url.match(/^\/robots.*\.txt$/i)) {
    event.node.res.setHeader('Content-Type', 'text/plain');
    event.node.res.end('User-Agent: *\nDisallow:\n');
    return;
  }
});
