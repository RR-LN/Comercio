resource "aws_security_group" "web" {
  name = "web-sg"
  description = "Security group for web servers"
  vpc_id = aws_vpc.main.id

  # HTTPS
  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP (redirect to HTTPS)
  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # WebSocket
  ingress {
    from_port = 8000
    to_port = 8000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db" {
  name = "db-sg"
  description = "Security group for database"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    security_groups = [aws_security_group.web.id]
  }
}

resource "aws_security_group" "redis" {
  name = "redis-sg"
  description = "Security group for Redis"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 6379
    to_port = 6379
    protocol = "tcp"
    security_groups = [aws_security_group.web.id]
  }
} 