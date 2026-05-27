# syntax=docker/dockerfile:1

FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline -DskipTests

COPY src ./src
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine AS runtime
RUN apk add --no-cache curl && \
    addgroup -S mol && adduser -S mol -u 1000 -G mol
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
RUN chown -R mol:mol /app
USER mol

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -sf http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
