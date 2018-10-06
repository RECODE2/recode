
# To build: docker build  --no-cache  -t recode -t reode:1.0 .
# To run: docker run -p 8081:8081 recode 

FROM node:8.12-stretch

RUN apt update && \
    apt install -y git mariadb-client && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt && \
    cd /opt && \
    git clone https://github.com/saso93/recode.git


RUN cd /opt/recode && \
    /usr/local/bin/npm install && \
    /usr/local/bin/npm run build

COPY recode_start.sh /usr/bin
RUN chmod +x /usr/bin/recode_start.sh
EXPOSE 8081
WORKDIR /opt/recode
CMD ["/usr/bin/recode_start.sh"]


