using AIHelpCenter.Knowledge.Application.Commands.ExtractKnowledge;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AIHelpCenter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KnowledgeController : ControllerBase
{
    private readonly IMediator _mediator;

    public KnowledgeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("extract")]
    public async Task<IActionResult> ExtractKnowledge([FromBody] ExtractKnowledgeRequest request)
    {
        var result = await _mediator.Send(new ExtractKnowledgeCommand(request.RawText, request.Domain, request.SourceId));
        
        if (result.IsFailure)
        {
            return BadRequest(result.Error);
        }

        return Ok(new { NuggetId = result.Value });
    }
}

public record ExtractKnowledgeRequest(string RawText, string Domain, string? SourceId);
