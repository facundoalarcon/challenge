docker system prune -af

docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

docker rmi $(docker images -a -q) -f

docker volume rm $(docker volume ls -qf dangling=true)
