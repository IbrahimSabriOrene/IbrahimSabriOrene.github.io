using AIHelpCenter.Intelligence.Application.Commands.Chat;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AIHelpCenter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChatController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
    {
        var result = await _mediator.Send(new ChatCommand(request.Message, request.ConversationId));
        
        if (result.IsFailure)
        {
            return BadRequest(result.Error);
        }

        return Ok(new { Response = result.Value });
    }
}

public record ChatRequest(string Message, Guid? ConversationId);
