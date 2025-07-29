#!/bin/sh
# Abort on any error
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running database seed..."
npm run db:seed

# Start the application server and worker in the background
echo "Starting server and worker..."
node dist/server.js &
node dist/worker.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?