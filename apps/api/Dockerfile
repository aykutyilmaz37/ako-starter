# Ako.Api container imajı. Derleme bağlamı: apps/api
#   docker build -t ako-api apps/api
# Çalışma: http://<host>:8080 — bağlantı ve ayarlar ortam değişkenleriyle verilir (ConnectionStrings__Default, Email__Smtp__Host…)

# --- derleme ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Önce yalnızca proje dosyaları: paket geri yükleme katmanı kod değişmedikçe önbellekten gelir.
COPY Directory.Build.props ./
COPY src/Ako.Api/Ako.Api.csproj src/Ako.Api/
RUN dotnet restore src/Ako.Api/Ako.Api.csproj

COPY src/ src/
RUN dotnet publish src/Ako.Api/Ako.Api.csproj -c Release -o /app --no-restore /p:OpenApiGenerateDocuments=false

# --- çalışma ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
# Npgsql'in Kerberos desteği bu kütüphaneyi arar; yoksa her açılışta hata mesajı basar.
RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app ./

# .NET imajları root olmayan "app" kullanıcısıyla gelir; container içinde 8080'i dinler.
USER app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# Sağlık kontrolü imajda değil, çalıştıran ortamda tanımlanır (Kubernetes probe, load balancer…):
#   canlılık: GET /health/live   hazır olma: GET /health/ready

ENTRYPOINT ["dotnet", "Ako.Api.dll"]
