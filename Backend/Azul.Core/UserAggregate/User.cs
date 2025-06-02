using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Azul.Core.UserAggregate;

public class User : IdentityUser<Guid>
{
    public DateOnly? LastVisitToPortugal { get; set; }

    public virtual UserStats Stats { get; set; }


}