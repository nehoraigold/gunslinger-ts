export const Verdict = {
    succeed<SuccessDataT>(data: SuccessDataT) {
        return { result: 'success' as const, data };
    },
    fail<FailReasonT>(reason: FailReasonT, message?: string) {
        return { result: 'failure' as const, reason, message };
    },
};
