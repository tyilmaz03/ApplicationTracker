# ====== Étape 1 : build du jar ======
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -e -B dependency:go-offline

COPY src ./src
RUN mvn -q -e -B package -DskipTests

# ====== Étape 2 : image runtime légère ======
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_NAME=application_tracker \
    DB_USER=appuser \
    DB_PASSWORD=secretpassword

ENTRYPOINT ["java","-jar","app.jar"]