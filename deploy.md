
```plaintext
docker build -t reservaciones-cicese-app -f ./dockerizer/Dockerfile .
docker run -p 3000:3000 reservaciones-cicese-app
```

```plaintext
docker login reservacionescicese.azurecr.io -u reservacionescicese -p "contraseña"
docker tag reservaciones-cicese-app reservacionescicese.azurecr.io/reservaciones-cicese-app:latest
docker push reservacionescicese.azurecr.io/reservaciones-cicese-app:latest
```
