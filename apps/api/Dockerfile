# Ako.Api container imajı. Derleme bağlamı repo kökü: web arayüzlerinin varsayılan metinleri
# (apps/web/*/app/locales/*.json) API'ye gömülür. Bağlama giren dosyalar Dockerfile.dockerignore'da.
#   docker build -f apps/api/Dockerfile -t ako-api .
# Çalışma: http://<host>:8080 — bağlantı ve ayarlar ortam değişkenleriyle verilir (ConnectionStrings__Default, Email__Smtp__Host…)

# --- derleme ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Önce yalnızca proje dosyaları: paket geri yükleme katmanı kod değişmedikçe önbellekten gelir.
COPY apps/api/Directory.Build.props apps/api/
COPY apps/api/src/Ako.Api/Ako.Api.csproj apps/api/src/Ako.Api/
RUN dotnet restore apps/api/src/Ako.Api/Ako.Api.csproj

COPY apps/web/ apps/web/
COPY apps/api/src/ apps/api/src/
RUN dotnet publish apps/api/src/Ako.Api/Ako.Api.csproj -c Release -o /app --no-restore /p:OpenApiGenerateDocuments=false

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
