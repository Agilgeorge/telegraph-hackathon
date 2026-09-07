import { Decision, Claim, RiskLevel, ActionRisk } from '../types/verification';
import { EvidenceItem } from '../types/evidence';

export function makeDecision(
  score: number,
  evidence: EvidenceItem[],
  claims: Claim[],
  overallRisk: RiskLevel,
  actionRisk: ActionRisk
): { action: Decision; reason: string } {
  // Hard override: prompt injection
  if (evidence.some((e) => e.type === 'injection')) {
    return { action: 'BLOCK', reason: 'Prompt injection instructions detected — unsafe to act upon' };
  }

  // Hard override: unverified financial action
  const hasFinancial = claims.some((c) => c.category === 'financial' && c.risk === 'critical');
  if (hasFinancial && score < 80) {
    return {
      action: 'BLOCK',
      reason: 'Financial action detected but insufficient independent verification to proceed safely',
    };
  }

  // Hard override: login/download with low score
  if ((actionRisk === 'login' || actionRisk === 'download') && score < 50) {
    return {
      action: 'BLOCK',
      reason: `${actionRisk === 'login' ? 'Login' : 'Download'} action detected with insufficient trust signals`,
    };
  }

  const warningCount = evidence.filter((e) => e.type === 'warning').length;

  if (score >= 85) {
    return { action: 'ALLOW', reason: 'Multiple independent signals confirm this content is trustworthy' };
  }

  if (score >= 60) {
    if (warningCount >= 2 || overallRisk === 'high' || overallRisk === 'critical') {
      return { action: 'WARN', reason: 'Content shows risk signals — proceed with caution and verify independently' };
    }
    return { action: 'ALLOW', reason: 'Content appears trustworthy with minor uncertainty' };
  }

  if (score >= 35) {
    return { action: 'WARN', reason: 'Insufficient evidence to confirm this content — verify independently before acting' };
  }

  return { action: 'BLOCK', reason: 'Multiple risk signals detected — this content is unsafe to act upon' };
}
