docker build -t chriswilliams1977/multi-client:latest -t chriswilliams1977/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t chriswilliams1977/multi-server:latest -t chriswilliams1977/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t chriswilliams1977/multi-worker:latest -t chriswilliams1977/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker tag chriswilliams1977/multi-client gcr.io/williamscj-gke-demos/multi-client:latest
docker tag chriswilliams1977/multi-client gcr.io/williamscj-gke-demos/multi-server:latest
docker tag chriswilliams1977/multi-client gcr.io/williamscj-gke-demos/multi-worker:latest
docker tag chriswilliams1977/multi-client gcr.io/williamscj-gke-demos/multi-client:$SHA
docker tag chriswilliams1977/multi-client gcr.io/williamscj-gke-demos/multi-server:$SHA
docker tag chriswilliams1977/multi-client gcr.io/williamscj-gke-demos/multi-worker:$SHA

docker push gcr.io/williamscj-gke-demos/multi-client:latest
docker push gcr.io/williamscj-gke-demos/multi-server:latest
docker push gcr.io/williamscj-gke-demos/multi-worker:latest
docker push gcr.io/williamscj-gke-demos/multi-client:$SHA
docker push gcr.io/williamscj-gke-demos/multi-server$SHA
docker push gcr.io/williamscj-gke-demos/multi-worker$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=gcr.io/williamscj-gke-demos/multi-server:$SHA
kubectl set image deployments/client-deployment client=gcr.io/williamscj-gke-demos/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=gcr.io/williamscj-gke-demos/multi-worker:$SHA
