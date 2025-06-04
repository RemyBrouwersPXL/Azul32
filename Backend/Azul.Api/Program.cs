
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;
using Azul.Api.Models.Output;
using Azul.Core.UserAggregate;
using Azul.Api.Services;
using Azul.Api.Services.Contracts;
using Azul.Api.Util;
using Azul.Bootstrapper;
using Azul.Core.BoardAggregate;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Azul.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Azul.Api.Hubs;


namespace Azul.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            ///////////////////////////////////
            // Dependency injection container//
            ///////////////////////////////////
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            builder.Services.AddSingleton(provider =>
                new AzulExceptionFilterAttribute(provider.GetRequiredService<ILogger<Program>>()));

            builder.Services.AddControllers(options =>
            {
                var onlyAuthenticatedUsersPolicy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
                    .RequireAuthenticatedUser().Build();
                options.Filters.Add(new AuthorizeFilter(onlyAuthenticatedUsersPolicy));
                options.Filters.AddService<AzulExceptionFilterAttribute>();
            }).AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new TwoDimensionalArrayJsonConverter<TileSpotModel>());
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policyBuilder => policyBuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "Azul API",
                    Description = "REST API for online Azul gameplay"
                });

                // Use XML documentation
                string xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml"; //api project
                options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

                xmlFilename = $"{typeof(User).Assembly.GetName().Name}.xml"; //core layer
                options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

                // Enable bearer token authentication
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Copy 'Bearer ' + valid token into field. You can retrieve a bearer token via '/api/authentication/token'"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            IConfiguration configuration = builder.Configuration;
            var tokenSettings = new TokenSettings();
            configuration.Bind("Token", tokenSettings);

            builder.Services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuer = tokenSettings.Issuer,
                        ValidAudience = tokenSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenSettings.Key)),
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;

                            if (!string.IsNullOrEmpty(accessToken) &&
                                path.StartsWithSegments("/hubs/chat")) // Match je SignalR endpoint
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddAuthorization();

            builder.Services.AddAutoMapper(typeof(Program));
            builder.Services.AddAutoMapper(typeof(UserModel));
            builder.Services.AddSingleton<ITokenFactory>(new JwtTokenFactory(tokenSettings));
            builder.Services.AddCore(configuration);
            builder.Services.AddScoped<StatsService>();
            builder.Services.AddInfrastructure(configuration);
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            Console.WriteLine($"Using connection string: {connectionString}"); // Log voor debug

            builder.Services.AddDbContext<AzulDbContext>(options =>
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorCodesToAdd: null);
                }));
            builder.Services.AddSignalR();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policyBuilder => policyBuilder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()); // Belangrijk voor SignalR
            });
            //////////////////////////////////////////////
            //Create database (if it does not exist yet)//
            //////////////////////////////////////////////

            var app = builder.Build();
            if (app.Environment.IsDevelopment() || app.Environment.IsProduction()) // Wijziging hier
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.EnsureDatabaseIsCreated();

            ////////////////////////
            // Middleware pipeline//
            ////////////////////////


            app.UseCors(policyName: "AllowAll");

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapHub<ChatHub>("/hubs/chat");

            app.MapControllers();

            
        }
    }
}
