# ================================
#  Étape 1 : build du jar
# ================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Charger les dépendances en cache pour accélérer les builds
COPY pom.xml ./
RUN mvn -q -B dependency:go-offline

# Copier le code source et builder
COPY src ./src
RUN mvn -q -B package -DskipTests

# ================================
#  Étape 2 : image runtime légère
# ================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Créer un user non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring

# Copier le jar compilé
COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar

USER spring

ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_NAME=application_tracker \
    DB_USER=appuser \
    DB_PASSWORD=secretpassword \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Healthcheck sur l'endpoint Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java","-jar","app.jar"]
