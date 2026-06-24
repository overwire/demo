FROM node:20-alpine

LABEL maintainer="acme-corp Platform Team"

RUN apk add --no-cache postgresql-client

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
