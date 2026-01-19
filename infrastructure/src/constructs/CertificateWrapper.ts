import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

interface CertificateWrapperProps extends cdk.StackProps {
	domain: string;
	webUrl: string;
	apiUrl: string;
}

export class CertificateWrapper extends Construct {
	public zone: route53.IHostedZone;
	public certificate: acm.Certificate;

	constructor(scope: Construct, id: string, props: CertificateWrapperProps) {
		super(scope, id);
		const { domain, webUrl: fullUrl, apiUrl } = props;

		// fetch route53 zone
		this.zone = route53.HostedZone.fromLookup(this, "zone", {
			domainName: domain,
		});

		// this will create a certificate
		this.certificate = new acm.Certificate(this, "certificate", {
			domainName: domain,
			subjectAlternativeNames: [fullUrl, apiUrl],
			validation: acm.CertificateValidation.fromDns(this.zone),
		});
	}
}
