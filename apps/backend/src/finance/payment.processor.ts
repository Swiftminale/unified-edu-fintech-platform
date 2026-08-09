import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('payment-events')
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'payment.reconciled') {
      const { invoiceId, bankTxId, amount, paymentDate } = job.data;
      this.logger.log(`Processing payment.reconciled job for invoice: ${invoiceId}`);

      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/payment-reconciled';

      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'payment.reconciled',
            timestamp: new Date().toISOString(),
            data: {
              invoiceId,
              bankTxId,
              amount,
              paymentDate,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`n8n webhook responded with status ${response.status}`);
        }

        this.logger.log(`Successfully dispatched payment.reconciled event to n8n webhook: ${n8nWebhookUrl}`);
      } catch (err: any) {
        this.logger.error(`Failed to forward payment.reconciled event to n8n: ${err.message}`);
        throw err;
      }
    }
  }
}
