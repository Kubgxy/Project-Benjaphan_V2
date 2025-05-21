# Frontend
server {
    listen 80;
    server_name benjaphan5.com;

    location / {
        proxy_pass http://Frontend:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://Backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Dashboard
server {
    listen 80;
    server_name admin-dashboard.benjaphan5.com;

    location / {
        proxy_pass http://Dashboard:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://Backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend
server {
	listen 80;
	server_name backend.benjaphan5.com;

	location / {
		allow 27.254.134.123;
		deny all;
		
		proxy_pass http://Backend:3000;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
	}
}